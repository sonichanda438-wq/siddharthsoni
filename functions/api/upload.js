export async function onRequestPost(context) {
  try {
    const request = context.request;
    const env = context.env;

    // Get image from frontend
    const formData = await request.formData();
    const image = formData.get("image");

    if (!image) {
      return Response.json(
        {
          success: false,
          error: "No image file provided"
        },
        { status: 400 }
      );
    }

    // Get ImgBB API key from Cloudflare environment variable
    const apiKey = env.IMGBB_API_KEY;

    if (!apiKey) {
      return Response.json(
        {
          success: false,
          error: "IMGBB_API_KEY is not configured"
        },
        { status: 500 }
      );
    }

    // Prepare ImgBB upload
    const imgbbFormData = new FormData();
    imgbbFormData.append("image", image);

    // Upload image to ImgBB
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        body: imgbbFormData
      }
    );

    const data = await response.json();

    // ImgBB itself returned an error
    if (!response.ok || !data.success) {
      console.error("ImgBB upload failed:", data);

      return Response.json(
        {
          success: false,
          error: data?.error?.message || "ImgBB upload failed"
        },
        { status: 502 }
      );
    }

    // Send successful ImgBB response back to website
    return Response.json({
      success: true,
      data: data.data
    });

  } catch (error) {
    console.error("Image upload error:", error);

    return Response.json(
      {
        success: false,
        error: "Internal server error during image upload"
      },
      { status: 500 }
    );
  }
}