import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'jsr:@supabase/supabase-js@2/cors';
import { updateExercise } from './updateExercise';

// WASM ImageMagick (supports many formats, including WebP)
import {
  ImageMagick,
  initializeImageMagick,
} from 'npm:@imagemagick/magick-wasm@0.0.30';

// Initialize ImageMagick once per instance
const wasmBytes = await Deno.readFile(
  new URL(
    'magick.wasm',
    import.meta.resolve('npm:@imagemagick/magick-wasm@0.0.30')
  )
);
await initializeImageMagick(wasmBytes);

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
  if (req.method !== 'PUT')
    return new Response(
      { error: `Not Found ${req.method} - /upload-image` },
      { status: 404, headers: corsHeaders }
    );

  try {
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
    const fileName = file?.name ?? 'upload.bin';

    const requestedPath = form.get('path')?.toString().trim();

    // If client provides "path", we treat it as a folder prefix (like "avatars/user123")
    // and we output "avatars/user123/<base>.webp"
    const objectPrefix =
      requestedPath && requestedPath.length > 0
        ? requestedPath.replace(/\s+/g, '_').replace(/\/+$/g, '')
        : '';

    const objectPath = objectPrefix
      ? `${objectPrefix}/${fileName}.webp`
      : `${fileName}.webp`;

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    if (!supabaseUrl) throw new Error('SUPABASE_URL is required');

    const rawSecrets = Deno.env.get('SUPABASE_SECRET_KEYS');
    if (!rawSecrets) throw new Error('SUPABASE_SECRET_KEYS is required');

    const secretKeys = JSON.parse(rawSecrets);
    const secretKey = secretKeys['default_scret_key']; // keep your existing key name logic
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

    // ---- Convert to WebP with ImageMagick WASM ----
    const inputBytes = new Uint8Array(await file.arrayBuffer());

    const webpBytes = ImageMagick.read(inputBytes, img => {
      // You can tweak quality (0-100). WebP quality controls compression quality.
      // img.quality(80) exists in ImageMagick; support depends on underlying build.
      // If your build doesn’t support `quality`, remove that line.
      try {
        // @ts-expect-error - quality method may not be in types
        img.quality(80);
      } catch {}

      // Ensure output is written as webp
      return img.write((data: Uint8Array) => data);
    });

    // ---- Upload converted bytes to Storage ----
    const { data, error } = await supabaseAdmin.storage
      .from('exercises_library')
      .upload(objectPath, webpBytes, {
        contentType: 'image/webp',
        upsert: true,
      });
    console.log('STORAGE ata: ', data);
    const { publicURL, error } = supabase.storage
      .from('public-bucket')
      .getPublicUrl('folder/avatar1.png');
    console.log('STORAGE publicURL: ', publicURL);

    if (error) {
      return jsonResponse(
        { error: error.message ?? String(error) },
        { status: 500, headers: corsHeaders }
      );
    }
    const id = form.get('id');
    const updtResponse = await updateExercise(id, data.path);
    console.log('updtResponse: ', updtResponse);
    return jsonResponse(
      {
        bucket: 'exercises_library',
        path: data.path,
        contentType: 'image/webp',
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
