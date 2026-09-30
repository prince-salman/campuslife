TRUNCATE TABLE public.assignments CASCADE;

TRUNCATE TABLE public.umkm CASCADE;

TRUNCATE TABLE public.transactions CASCADE;

UPDATE public.wallets
SET balance = 0,
    updated_at = NOW();
