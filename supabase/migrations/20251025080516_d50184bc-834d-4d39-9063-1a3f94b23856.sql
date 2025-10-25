-- Create schedule_comments table
CREATE TABLE public.schedule_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on schedule_comments
ALTER TABLE public.schedule_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for comments
CREATE POLICY "Anyone can view comments" ON public.schedule_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.schedule_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.schedule_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.schedule_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Create schedule_reactions table
CREATE TABLE public.schedule_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(schedule_id, user_id, emoji)
);

-- Enable RLS on schedule_reactions
ALTER TABLE public.schedule_reactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for reactions
CREATE POLICY "Anyone can view reactions" ON public.schedule_reactions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add reactions" ON public.schedule_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own reactions" ON public.schedule_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.schedule_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.schedule_reactions;