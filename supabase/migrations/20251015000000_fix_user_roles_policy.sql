-- Fix user_roles RLS policies to allow admins to manage roles for other users

-- Drop existing policy
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;

-- Create separate policies for better control
CREATE POLICY "Anyone can view roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can insert roles for any user" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update roles for any user" 
  ON public.user_roles 
  FOR UPDATE 
  USING (
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete roles for any user" 
  ON public.user_roles 
  FOR DELETE 
  USING (
    public.has_role(auth.uid(), 'admin')
  );






