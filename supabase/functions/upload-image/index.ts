import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'jsr:@supabase/supabase-js@2/cors';

function jsonResponse(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS')
    return new Response('ok', { headers: corsHeaders });

  try {
    // Expect multipart/form-data with fields:
    // - file: the image Blob/File
    // - path: optional object path (defaults to provided name)
    // - filename: optional original filename
    const contentType = req.headers.get('content-type') ?? '';
    if (!contentType.includes('multipart/form-data')) {
      return jsonResponse(
        { error: 'Content-Type must be multipart/form-data' },
        { status: 400, headers: corsHeaders }
      );
    }

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return jsonResponse(
        { error: "Missing 'file' form field" },
        { status: 400, headers: corsHeaders }
      );
    }

    const filenameFromClient = (
      form.get('filename')?.toString() ??
      file.name ??
      'upload.bin'
    ).trim();
    const sanitizedFilename = filenameFromClient.replace(
      /[^a-zA-Z0-9._-]/g,
      '_'
    );

    // Since you asked for `root`, default to bucket root.
    // If the client provides `path`, we respect it (still sanitized).
    const requestedPath = form.get('path')?.toString().trim();
    const objectPath =
      requestedPath && requestedPath.length > 0
        ? requestedPath.replace(/\s+/g, '_')
        : sanitizedFilename;

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    if (!supabaseUrl) throw new Error('SUPABASE_URL is required');

    const rawSecrets = Deno.env.get('SUPABASE_SECRET_KEYS');
    if (!rawSecrets) throw new Error('SUPABASE_SECRET_KEYS is required');
    const secretKeys = JSON.parse(rawSecrets);

    const secretKey = secretKeys['default_scret_key'];
    if (!secretKey) {
      return jsonResponse(
        {
          error:
            "Missing secret key 'default_scret_key' in SUPABASE_SECRET_KEYS",
        },
        { status: 500, headers: corsHeaders }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, secretKey);

    const bucket = 'exercises_library';
    const uploadContentType = file.type || 'application/octet-stream';

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(objectPath, file, {
        contentType: uploadContentType,
        upsert: true,
      });

    if (error) {
      return jsonResponse(
        { error: error.message ?? String(error) },
        { status: 500, headers: corsHeaders }
      );
    }

    return jsonResponse(
      {
        bucket,
        path: data.path,
        contentType: uploadContentType,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    return jsonResponse(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500, headers: corsHeaders }
    );
  }
});
