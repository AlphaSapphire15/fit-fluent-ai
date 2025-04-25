
import { supabase } from "@/integrations/supabase/client";

export interface StyleCore {
  base: string;
  flavor: string;
  full_label: string;
  description: string | null;
}

export async function findMatchingStyleCore(styleText: string): Promise<StyleCore | null> {
  try {
    // Fetch all style cores from Supabase
    const { data: styleCores, error } = await supabase
      .from('style_cores')
      .select('*');

    if (error) {
      console.error('Error fetching style cores:', error);
      return null;
    }

    if (!styleCores || styleCores.length === 0) {
      console.log('No style cores found in database');
      return null;
    }

    console.log('Retrieved style cores:', styleCores);
    
    // Find the best match
    const matchedCore = styleCores.find(core => 
      styleText.toLowerCase().includes(core.base.toLowerCase()) ||
      styleText.toLowerCase().includes(core.flavor.toLowerCase()) ||
      (core.full_label && styleText.toLowerCase().includes(core.full_label.toLowerCase()))
    );

    if (matchedCore) {
      console.log('Found matching style core:', matchedCore);
      return matchedCore;
    }
    
    // Default to first style core if no match found
    console.log('No matching style core found, using default:', styleCores[0]);
    return styleCores[0];
  } catch (err) {
    console.error('Error in findMatchingStyleCore:', err);
    return null;
  }
}
