-- Add foreign key from schedule_comments to profiles
ALTER TABLE public.schedule_comments 
ADD CONSTRAINT schedule_comments_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(user_id) 
ON DELETE CASCADE;