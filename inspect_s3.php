<?php
use Illuminate\Support\Facades\Storage;

$files = ['products/coconut_original.png', 'products/coconut_lime.png', 'products/coconut_pudding.png'];

foreach ($files as $f) {
    try {
        $meta = Storage::disk('s3')->getMetadata($f);
        $url = Storage::disk('s3')->url($f);
        echo "File: $f\n";
        echo "URL: $url\n";
        echo "Mime: " . (isset($meta['mimetype']) ? $meta['mimetype'] : 'unknown') . "\n";
        echo "Size: " . (isset($meta['size']) ? $meta['size'] : 'unknown') . "\n\n";
    } catch (\Exception $e) {
        echo "Error for $f: " . $e->getMessage() . "\n\n";
    }
}
