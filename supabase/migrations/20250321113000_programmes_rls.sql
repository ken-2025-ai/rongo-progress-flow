-- Enable RLS on programmes and allow only SUPER_ADMIN writes
ALTER TABLE public.programmes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super Admin Bypass Programmes" ON public.programmes;
CREATE POLICY "Super Admin Bypass Programmes" ON public.programmes
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'));

