-- Create comment likes table
CREATE TABLE public.schedule_comment_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.schedule_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS
ALTER TABLE public.schedule_comment_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view comment likes"
  ON public.schedule_comment_likes
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add likes"
  ON public.schedule_comment_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own likes"
  ON public.schedule_comment_likes
  FOR DELETE
  USING (auth.uid() = user_id);