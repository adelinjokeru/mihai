import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('elev')
      .select('*')
      .order('nume');

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error:any) {
    console.error('Error:', error.message);
    return NextResponse.json({ error: 'Error fetching elevi' + error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, error } = await supabase
      .from('elev')
      .insert([body])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error creating elev' + error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, ) {
  try {
    const body = await request.json();
    const { error } = await supabase
      .from('elev')
      .delete()
      .eq('id', body?.id);

    if (error) throw error;
    return NextResponse.json({ message: 'Elev deleted successfully' });
  } catch (error: any) {
    console.error('Error:', error.message);
    return NextResponse.json({ error: 'Error deleting elev: ' + error.message }, { status: 500 });
  }
}
