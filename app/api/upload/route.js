export const runtime = 'edge';

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // 1. Extract the image from the incoming frontend request
    const formData = await request.formData();
    const image = formData.get('image');

    if (!image) {
      return NextResponse.json(
        { success: false, error: "No image file provided" }, 
        { status: 400 }
      );
    }

    // 2. Create a new FormData object specifically for the IMGBB API
    const imgbbFormData = new FormData();
    imgbbFormData.append('image', image);

    // 3. Retrieve the secure API key from environment variables (.env.local)
    const apiKey = process.env.IMGBB_API_KEY;

    // 4. Send the image to IMGBB securely from the backend server
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: imgbbFormData,
    });

    const data = await response.json();
    
    // 5. Return the IMGBB response back to the client/frontend
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during upload" }, 
      { status: 500 }
    );
  }
}
