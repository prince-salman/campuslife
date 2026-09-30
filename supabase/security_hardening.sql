CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS managed_class TEXT;

DO $$
BEGIN
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
        CHECK (role IN ('admin', 'class_manager', 'user'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_class_manager(target_class TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() 
          AND (
            role = 'admin' OR 
            (role = 'class_manager' AND (managed_class = target_class OR managed_class IS NULL))
          )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.protect_profile_roles()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT public.is_admin() THEN
        NEW.role := OLD.role;
        NEW.managed_class := OLD.managed_class;
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_roles ON public.profiles;
CREATE TRIGGER trg_protect_profile_roles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_profile_roles();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    assigned_role TEXT := 'user';
    assigned_class TEXT := NULL;
BEGIN
    IF NEW.email IS NOT NULL 
       AND NEW.email NOT LIKE '%@student.president.ac.id' 
       AND NEW.email <> 'admin@campuslife.com' THEN
        RAISE EXCEPTION 'Registrasi hanya diperbolehkan untuk akun @student.president.ac.id';
    END IF;

    IF NEW.email = 'admin@campuslife.com' THEN
        assigned_role := 'admin';
    ELSIF NEW.email = 'classmanager.it1@student.president.ac.id' THEN
        assigned_role := 'class_manager';
        assigned_class := 'IT 1';
    ELSE
        assigned_role := 'user';
    END IF;

    INSERT INTO public.profiles (id, email, full_name, role, managed_class)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email, 'User'), '@', 1)),
        assigned_role,
        assigned_class
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);

    IF assigned_role = 'user' THEN
        INSERT INTO public.wallets (user_id, balance)
        VALUES (NEW.id, 0)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TABLE IF NOT EXISTS public.assignments (
    id TEXT PRIMARY KEY,
    class_name TEXT NOT NULL,
    course_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    deadline_date TEXT NOT NULL,
    deadline_time TEXT NOT NULL DEFAULT '23:59 WIB',
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    submission_link TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.umkm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are readable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are readable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Profiles can be updated by self" ON public.profiles;
CREATE POLICY "Profiles can be updated by self"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Assignments viewable by authenticated users" ON public.assignments;
CREATE POLICY "Assignments viewable by authenticated users"
    ON public.assignments FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Assignments insertable by class manager or admin" ON public.assignments;
CREATE POLICY "Assignments insertable by class manager or admin"
    ON public.assignments FOR INSERT
    TO authenticated
    WITH CHECK (public.is_class_manager(assignments.class_name));

DROP POLICY IF EXISTS "Assignments updatable by class manager or admin" ON public.assignments;
CREATE POLICY "Assignments updatable by class manager or admin"
    ON public.assignments FOR UPDATE
    TO authenticated
    USING (public.is_class_manager(assignments.class_name))
    WITH CHECK (public.is_class_manager(assignments.class_name));

DROP POLICY IF EXISTS "Assignments deletable by class manager or admin" ON public.assignments;
CREATE POLICY "Assignments deletable by class manager or admin"
    ON public.assignments FOR DELETE
    TO authenticated
    USING (public.is_class_manager(assignments.class_name));

DROP POLICY IF EXISTS "UMKM are readable by all" ON public.umkm;
CREATE POLICY "UMKM are readable by all"
    ON public.umkm FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "UMKM insertable only by admin" ON public.umkm;
CREATE POLICY "UMKM insertable only by admin"
    ON public.umkm FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "UMKM updatable only by admin" ON public.umkm;
CREATE POLICY "UMKM updatable only by admin"
    ON public.umkm FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "UMKM deletable only by admin" ON public.umkm;
CREATE POLICY "UMKM deletable only by admin"
    ON public.umkm FOR DELETE
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Schedules owned by user only" ON public.schedules;
CREATE POLICY "Schedules owned by user only"
    ON public.schedules FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Transactions owned by user only" ON public.transactions;
CREATE POLICY "Transactions owned by user only"
    ON public.transactions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Transactions insertable by user only" ON public.transactions;
CREATE POLICY "Transactions insertable by user only"
    ON public.transactions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Wallets owned by user only" ON public.wallets;
CREATE POLICY "Wallets owned by user only"
    ON public.wallets FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
