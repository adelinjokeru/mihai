import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function DELETE(request: Request, ) {
  try {
    const body = await request.json();
    const { error } = await supabase
      .from('echipament')
      .delete()
      .eq('id', body?.id);

    if (error) throw error;
    return NextResponse.json({ message: 'Echipament deleted successfully' });
  } catch (error: any) {
    console.error('Error:', error.message);
    return NextResponse.json({ error: 'Error deleting echipament: ' + error.message }, { status: 500 });
  }
}
