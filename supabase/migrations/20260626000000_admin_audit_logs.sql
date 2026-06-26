CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    lecture_id UUID,
    lecture_name TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for the new table
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view logs (Admins use authenticated dashboard)
CREATE POLICY "Enable read access for authenticated users"
ON public.admin_audit_logs FOR SELECT
TO authenticated
USING (true);

-- Trigger function
CREATE OR REPLACE FUNCTION public.log_admin_action()
RETURNS TRIGGER AS $$
DECLARE
  v_admin_id UUID;
  v_action_type TEXT;
  v_entity_type TEXT;
  v_entity_id UUID;
  v_lecture_id UUID := NULL;
  v_lecture_name TEXT := NULL;
  v_details JSONB;
BEGIN
  -- We assume auth.uid() gives us the admin doing the action
  v_admin_id := auth.uid();
  
  v_action_type := TG_OP;
  v_entity_type := TG_TABLE_NAME;
  
  IF TG_OP = 'DELETE' THEN
    v_entity_id := OLD.id;
    v_details := row_to_json(OLD)::jsonb;
  ELSE
    v_entity_id := NEW.id;
    v_details := row_to_json(NEW)::jsonb;
  END IF;

  -- specific logic to find lecture_id and lecture_name
  IF v_entity_type = 'questions' THEN
    IF TG_OP = 'DELETE' THEN
      v_lecture_id := OLD.lecture_id;
    ELSE
      v_lecture_id := NEW.lecture_id;
    END IF;
    SELECT name INTO v_lecture_name FROM public.lectures WHERE id = v_lecture_id;
  ELSIF v_entity_type = 'lectures' THEN
    v_lecture_id := v_entity_id;
    IF TG_OP = 'DELETE' THEN
      v_lecture_name := OLD.name;
    ELSE
      v_lecture_name := NEW.name;
    END IF;
  END IF;

  INSERT INTO public.admin_audit_logs (
    admin_id, action_type, entity_type, entity_id, lecture_id, lecture_name, details
  ) VALUES (
    v_admin_id, v_action_type, v_entity_type, v_entity_id, v_lecture_id, v_lecture_name, v_details
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
DROP TRIGGER IF EXISTS audit_questions_trigger ON public.questions;
CREATE TRIGGER audit_questions_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.questions
FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();

DROP TRIGGER IF EXISTS audit_lectures_trigger ON public.lectures;
CREATE TRIGGER audit_lectures_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.lectures
FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();

DROP TRIGGER IF EXISTS audit_modules_trigger ON public.modules;
CREATE TRIGGER audit_modules_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.modules
FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();

DROP TRIGGER IF EXISTS audit_subjects_trigger ON public.subjects;
CREATE TRIGGER audit_subjects_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.subjects
FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();

DROP TRIGGER IF EXISTS audit_years_trigger ON public.years;
CREATE TRIGGER audit_years_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.years
FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();
