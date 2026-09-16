-- ==============================================================================
-- CAMPUSLIFE - SUPABASE DATABASE SCHEMA & RLS POLICIES
-- Project URL: https://nepsoinveldfsncrgdvn.supabase.co
-- ==============================================================================

-- 1. Enable pgcrypto for password hashing in admin RPC if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. PROFILES TABLE (User Accounts & Roles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. UMKM TABLE (Shared global catalog, all users read, only admin can write)
CREATE TABLE IF NOT EXISTS public.umkm (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price_tag TEXT NOT NULL,
    rating NUMERIC(3, 1) DEFAULT 4.8,
    reviews_count INTEGER DEFAULT 0,
    banner_text TEXT DEFAULT '',
    card_color_hex TEXT DEFAULT '#2C2D30',
    image_url TEXT,
    phone TEXT,
    address TEXT,
    distance TEXT,
    opening_hours TEXT,
    services JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SCHEDULES TABLE (Personal student schedules - Admin has NO access)
CREATE TABLE IF NOT EXISTS public.schedules (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    day_index INTEGER NOT NULL,
    day_name TEXT NOT NULL,
    day_number TEXT NOT NULL,
    title TEXT NOT NULL,
    lecturer TEXT,
    room TEXT,
    time TEXT,
    time_period TEXT,
    time_range TEXT,
    duration TEXT,
    header_color TEXT DEFAULT '#2E7979',
    card_color TEXT DEFAULT '#5FB8B2',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TRANSACTIONS & WALLETS (Personal student finances - Admin has NO access)
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'spent')),
    icon_name TEXT DEFAULT 'restaurant',
    month TEXT NOT NULL,
    date_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wallets (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    balance NUMERIC(14, 2) NOT NULL DEFAULT 1000000,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. AUTH TRIGGER & PRESIDENT UNIVERSITY EMAIL VALIDATION
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    assigned_role TEXT := 'user';
BEGIN
    -- Validasi: User biasa wajib menggunakan email @student.president.ac.id
    -- Pengecualian hanya untuk email admin tertentu yang telah disetujui (admin@...)
    IF NEW.email NOT LIKE '%@student.president.ac.id' AND NEW.email NOT LIKE 'admin@%' THEN
        RAISE EXCEPTION 'Pendaftaran akun mahasiswa wajib menggunakan email resmi President University (@student.president.ac.id)';
    END IF;

    -- Pendaftaran publik selalu mendapatkan role = 'user'
    -- Admin hanya jika email admin@campuslife.com saat setup awal
    IF NEW.email = 'admin@campuslife.com' THEN
        assigned_role := 'admin';
    ELSE
        assigned_role := 'user';
    END IF;

    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        assigned_role
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);

    -- Inisialisasi wallet untuk akun mahasiswa
    IF assigned_role = 'user' THEN
        INSERT INTO public.wallets (user_id, balance)
        VALUES (NEW.id, 1000000)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pasang trigger pada auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.umkm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- Helper function: cek apakah caller adalah admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Profiles are readable by self and admin" ON public.profiles;
CREATE POLICY "Profiles are readable by self and admin"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Profiles can be updated by self and admin" ON public.profiles;
CREATE POLICY "Profiles can be updated by self and admin"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

-- UMKM POLICIES (Global Shared: Anyone reads, only Admin writes)
DROP POLICY IF EXISTS "UMKM are readable by all authenticated and anon" ON public.umkm;
CREATE POLICY "UMKM are readable by all authenticated and anon"
    ON public.umkm FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "UMKM insertable only by admin" ON public.umkm;
CREATE POLICY "UMKM insertable only by admin"
    ON public.umkm FOR INSERT
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "UMKM updatable only by admin" ON public.umkm;
CREATE POLICY "UMKM updatable only by admin"
    ON public.umkm FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "UMKM deletable only by admin" ON public.umkm;
CREATE POLICY "UMKM deletable only by admin"
    ON public.umkm FOR DELETE
    USING (public.is_admin());

-- SCHEDULES POLICIES (Strictly per user - Admin has NO access)
DROP POLICY IF EXISTS "Schedules owned by user only" ON public.schedules;
CREATE POLICY "Schedules owned by user only"
    ON public.schedules FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- TRANSACTIONS POLICIES (Strictly per user - Admin has NO access)
DROP POLICY IF EXISTS "Transactions owned by user only" ON public.transactions;
CREATE POLICY "Transactions owned by user only"
    ON public.transactions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- WALLETS POLICIES (Strictly per user - Admin has NO access)
DROP POLICY IF EXISTS "Wallets owned by user only" ON public.wallets;
CREATE POLICY "Wallets owned by user only"
    ON public.wallets FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 8. ADMIN RPC FUNCTIONS (User Management & Reset Password)
-- ==============================================================================

-- Reset Password function for Admin
CREATE OR REPLACE FUNCTION public.admin_reset_user_password(
    target_user_id UUID,
    new_password TEXT
)
RETURNS JSONB AS $$
BEGIN
    -- Verifikasi bahwa pemanggil adalah admin
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Akses ditolak: Hanya admin yang dapat mereset password pengguna.';
    END IF;

    -- Update encrypted password di auth.users
    UPDATE auth.users
    SET encrypted_password = crypt(new_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE id = target_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Password berhasil direset oleh admin.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update user role or profile by Admin
CREATE OR REPLACE FUNCTION public.admin_update_user(
    target_user_id UUID,
    new_full_name TEXT,
    new_role TEXT
)
RETURNS JSONB AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Akses ditolak: Hanya admin yang dapat mengubah data pengguna.';
    END IF;

    IF new_role NOT IN ('admin', 'user') THEN
        RAISE EXCEPTION 'Role tidak valid. Harus admin atau user.';
    END IF;

    UPDATE public.profiles
    SET full_name = COALESCE(new_full_name, full_name),
        role = COALESCE(new_role, role),
        updated_at = NOW()
    WHERE id = target_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Profil pengguna berhasil diperbarui.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete user by Admin
CREATE OR REPLACE FUNCTION public.admin_delete_user(
    target_user_id UUID
)
RETURNS JSONB AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Akses ditolak: Hanya admin yang dapat menghapus pengguna.';
    END IF;

    -- Jangan biarkan admin menghapus dirinya sendiri
    IF target_user_id = auth.uid() THEN
        RAISE EXCEPTION 'Admin tidak dapat menghapus akunnya sendiri.';
    END IF;

    DELETE FROM auth.users WHERE id = target_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Pengguna berhasil dihapus.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 9. INITIAL SEED DATA: UMKM CATALOG
-- ==============================================================================
INSERT INTO public.umkm (id, name, category, price_tag, rating, reviews_count, banner_text, card_color_hex, image_url, phone, address, distance, opening_hours, services)
VALUES
(
    '1',
    'Kokoes Bites',
    'F&B',
    '15K',
    5.0,
    142,
    'Kokoes Dessert',
    '#2C2D30',
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop',
    '+62 812-3456-7890',
    'Jl. Kaliurang KM 5 No. 18, Seberang Gedung Fasilkom',
    '150 m dari Gerbang Utama',
    '10:00 – 21:30 WIB',
    '[
        {"name": "Mango Sago Jelly Special", "price": "Rp 15.000", "description": "Potongan mangga segar, sagu mutiara & cream keju lumer"},
        {"name": "Buko Pandan Creamy", "price": "Rp 15.000", "description": "Kelapa muda, agar pandan, nata de coco & susu kental"},
        {"name": "Choco Mousse Cup", "price": "Rp 18.000", "description": "Dark chocolate mousse lembut dengan topping choco chips"}
    ]'::jsonb
),
(
    '2',
    'Bakso Sapi Enak',
    'F&B',
    '10K',
    4.8,
    230,
    'BAKSO FAVORIT',
    '#8B2500',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop',
    '+62 857-9876-5432',
    'Jl. Agro No. 4, Belakang Perpustakaan Pusat',
    '120 m dari Fakultas Teknik',
    '09:00 – 21:00 WIB',
    '[
        {"name": "Bakso Urat Jumbo Komplit", "price": "Rp 15.000", "description": "1 bakso urat besar, 2 bakso halus, tahu bakso & mie kuning"},
        {"name": "Bakso Halus Kuah Gurih", "price": "Rp 10.000", "description": "5 bakso halus sapi asli dengan kaldu sapi sedap"}
    ]'::jsonb
),
(
    '3',
    'Ayam Geprek Kampus',
    'F&B',
    '12K',
    4.9,
    310,
    'AYAM GEPREK',
    '#8B1A1A',
    'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop',
    '+62 821-4567-8901',
    'Kantin Mahasiswa Blok B No. 3',
    '50 m dari Student Center',
    '08:30 – 19:00 WIB',
    '[
        {"name": "Paket Geprek Original Level 1-5", "price": "Rp 12.000", "description": "Ayam krispi digeprek sambal bawang pedas + nasi hangat + lalapan"},
        {"name": "Paket Geprek Keju Mozarella", "price": "Rp 17.000", "description": "Ayam geprek dengan lelehan keju mozarella tebal"}
    ]'::jsonb
),
(
    '4',
    'Kopi Senja Mahasiswa',
    'F&B',
    '12K',
    4.7,
    185,
    'KOPI & NONGKRONG',
    '#3D2B1F',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop',
    '+62 813-2468-1357',
    'Jl. Colombo No. 12 (Lt. 2)',
    '200 m dari Asrama Mahasiswa',
    '10:00 – 23:00 WIB',
    '[
        {"name": "Es Kopi Susu Senja", "price": "Rp 12.000", "description": "Espresso arabika blend, susu segar & gula aren asli"},
        {"name": "Caramel Macchiato", "price": "Rp 16.000", "description": "Espresso layered dengan susu vanilla & drizzle saus karamel"}
    ]'::jsonb
),
(
    '5',
    'Laundry Express 24 Jam',
    'Laundry',
    '6K',
    4.9,
    420,
    'LAUNDRY KILAT',
    '#1B4D3E',
    'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&auto=format&fit=crop',
    '+62 878-1122-3344',
    'Jl. Flamboyan No. 7, Samping Indomaret',
    '100 m dari Gerbang Barat',
    'Buka 24 Jam Nonstop',
    '[
        {"name": "Cuci Kering Lipat (Per Kg)", "price": "Rp 6.000/kg", "description": "Pengerjaan 1 hari, deterjen wangi anti kuman & softener premium"},
        {"name": "Cuci Setrika Reguler (Per Kg)", "price": "Rp 8.000/kg", "description": "Pengerjaan 2 hari rapi beraroma lavender"},
        {"name": "Express 3 Jam Selesai", "price": "Rp 15.000/kg", "description": "Layanan super kilat 3 jam selesai"}
    ]'::jsonb
),
(
    '6',
    'Prima Print & Fotocopy',
    'Fotocopy',
    '500',
    4.8,
    390,
    'PRINT & JILID',
    '#1C3144',
    'https://images.unsplash.com/photo-1568667256549-094345857637?w=600&auto=format&fit=crop',
    '+62 896-5544-3322',
    'Jl. Cenderawasih No. 2, Depan Gedung Rektorat',
    '70 m dari Gedung Rektorat',
    '07:00 – 22:00 WIB',
    '[
        {"name": "Fotocopy Hitam Putih A4 (per lembar)", "price": "Rp 250", "description": "Kertas 75 gsm tajam dan bersih"},
        {"name": "Print Warna High Res A4", "price": "Rp 1.000", "description": "Kertas 80 gsm warna tajam tidak luntur"},
        {"name": "Jilid Hardcover Skripsi", "price": "Rp 35.000", "description": "Embos tulisan emas, pita pembatas & sudut siku rapi"}
    ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 10. HELPER FUNCTION: CREATE SEED ADMIN AND STUDENT ACCOUNTS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.seed_default_accounts()
RETURNS TEXT AS $$
DECLARE
    admin_id UUID;
    student_id UUID;
BEGIN
    -- 1. Buat akun Admin jika belum ada
    SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@campuslife.com';
    IF admin_id IS NULL THEN
        admin_id := gen_random_uuid();
        INSERT INTO auth.users (
            id, instance_id, email, encrypted_password, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
        ) VALUES (
            admin_id,
            '00000000-0000-0000-0000-000000000000',
            'admin@campuslife.com',
            crypt('AdminPassword123!', gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Administrator CampusLife"}',
            NOW(),
            NOW(),
            'authenticated',
            'authenticated'
        );
    END IF;

    -- Pastikan role admin tercatat di profiles
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (admin_id, 'admin@campuslife.com', 'Administrator CampusLife', 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Administrator CampusLife';

    -- 2. Buat akun Mahasiswa jika belum ada
    SELECT id INTO student_id FROM auth.users WHERE email = 'mahasiswa@student.president.ac.id';
    IF student_id IS NULL THEN
        student_id := gen_random_uuid();
        INSERT INTO auth.users (
            id, instance_id, email, encrypted_password, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
        ) VALUES (
            student_id,
            '00000000-0000-0000-0000-000000000000',
            'mahasiswa@student.president.ac.id',
            crypt('StudentPassword123!', gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Derrian Kalalo"}',
            NOW(),
            NOW(),
            'authenticated',
            'authenticated'
        );
    END IF;

    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (student_id, 'mahasiswa@student.president.ac.id', 'Derrian Kalalo', 'user')
    ON CONFLICT (id) DO UPDATE SET role = 'user', full_name = 'Derrian Kalalo';

    -- Inisialisasi dompet mahasiswa jika belum ada
    INSERT INTO public.wallets (user_id, balance)
    VALUES (student_id, 1000025)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN 'Default accounts created: admin@campuslife.com & mahasiswa@student.president.ac.id';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Jalankan fungsi seed akun bawaan
SELECT public.seed_default_accounts();
