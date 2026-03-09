import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getIngredients, saveIngredients, getFlavours } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ingredients = await getIngredients();
    const ingredient = ingredients.find((i: any) => i.id === params.id);
    
    if (!ingredient) {
      return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 });
    }
    
    return NextResponse.json(ingredient);
  } catch (error) {
    console.error('Error fetching ingredient:', error);
    return NextResponse.json({ error: 'Failed to fetch ingredient' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const ingredients = await getIngredients();
    const index = ingredients.findIndex((i: any) => i.id === params.id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 });
    }
    
    ingredients[index] = {
      ...ingredients[index],
      ...body,
      id: params.id,
      updatedAt: new Date().toISOString(),
    };
    
    await saveIngredients(ingredients);
    
    return NextResponse.json(ingredients[index]);
  } catch (error) {
    console.error('Error updating ingredient:', error);
    return NextResponse.json({ error: 'Failed to update ingredient' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if ingredient is used in any flavours
    const flavours = await getFlavours();
    const usedInFlavours = flavours.filter((f: any) => 
      f.coreIngredients?.includes(params.id) || f.allIngredients?.includes(params.id)
    );
    
    if (usedInFlavours.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete ingredient',
          message: `This ingredient is used in ${usedInFlavours.length} flavour(s)`,
          flavours: usedInFlavours.map((f: any) => f.name)
        },
        { status: 400 }
      );
    }
    
    const ingredients = await getIngredients();
    const filtered = ingredients.filter((i: any) => i.id !== params.id);
    
    if (filtered.length === ingredients.length) {
      return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 });
    }
    
    await saveIngredients(filtered);
    
    return NextResponse.json({ message: 'Ingredient deleted successfully' });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    return NextResponse.json({ error: 'Failed to delete ingredient' }, { status: 500 });
  }
}
