export async function onRequestGet(context) {
  try {
    const { env } = context;

    if (!env.DB) {
      return Response.json(
        {
          success: false,
          error: "D1 database binding 'DB' is not configured",
        },
        { status: 500 }
      );
    }

    const result = await env.DB.prepare(`
      SELECT
        id,
        name,
        email,
        rating,
        feedback,
        image_url,
        created_at
      FROM reviews
      ORDER BY created_at ASC
    `).all();

    const reviews = (result.results || []).map((row) => ({
      "Your Name": row.name || "",
      "Star Rating": String(row.rating || 5),
      "Your Review Message": row.feedback || "",
      "Your Photo": row.image_url || "",
    }));

    return Response.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("Reviews GET error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to load reviews",
      },
      { status: 500 }
    );
  }
}


export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    if (!env.DB) {
      return Response.json(
        {
          success: false,
          error: "D1 database binding 'DB' is not configured",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim();
    const rating = Number(body?.rating);
    const feedback = String(body?.feedback || "").trim();

    /*
     * page.js currently sends imageKey.
     * After upload.js is updated, this will contain the
     * permanent ImgBB image URL.
     */
    const imageUrl = String(
      body?.imageUrl || body?.imageKey || ""
    ).trim();

    if (!name) {
      return Response.json(
        {
          success: false,
          error: "Name is required",
        },
        { status: 400 }
      );
    }

    if (!feedback) {
      return Response.json(
        {
          success: false,
          error: "Review message is required",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return Response.json(
        {
          success: false,
          error: "Rating must be between 1 and 5",
        },
        { status: 400 }
      );
    }

    const createdAt = new Date().toISOString();

    const insertResult = await env.DB.prepare(`
      INSERT INTO reviews
        (name, email, rating, feedback, image_url, created_at)
      VALUES
        (?, ?, ?, ?, ?, ?)
    `)
      .bind(
        name,
        email,
        rating,
        feedback,
        imageUrl,
        createdAt
      )
      .run();

    if (!insertResult.success) {
      throw new Error("D1 insert failed");
    }

    const insertedReview = await env.DB.prepare(`
      SELECT
        id,
        name,
        email,
        rating,
        feedback,
        image_url,
        created_at
      FROM reviews
      WHERE id = ?
    `)
      .bind(insertResult.meta.last_row_id)
      .first();

    return Response.json({
      success: true,
      review: {
        id: insertedReview?.id,
        name: insertedReview?.name || name,
        email: insertedReview?.email || email,
        rating: insertedReview?.rating || rating,
        feedback: insertedReview?.feedback || feedback,
        imageUrl: insertedReview?.image_url || imageUrl,
        createdAt: insertedReview?.created_at || createdAt,
      },
    });
  } catch (error) {
    console.error("Reviews POST error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to save review",
      },
      { status: 500 }
    );
  }
}