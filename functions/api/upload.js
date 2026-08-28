export async function onRequestPost(context) {
  try {
    const request = context.request;
    const env = context.env;

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

    const imgbbFormData = new FormData();
    imgbbFormData.append("image", image);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        body: imgbbFormData
      }
    );

    const data = await response.json();

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

    const imageUrl = data?.data?.url || "";

    if (!imageUrl) {
      return Response.json(
        {
          success: false,
          error: "ImgBB did not return an image URL"
        },
        { status: 502 }
      );
    }

    // page.js ko public ImgBB image URL milega
    return Response.json({
      success: true,
      key: imageUrl,
      imageUrl: imageUrl,
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