<?php
use Illuminate\Support\Facades\Storage;

$files = [
    'coconut_original.png' => 'products/coconut_original.png',
    'coconut_lime.png' => 'products/coconut_lime.png',
    'coconut_pudding.png' => 'products/coconut_pudding.png'
];

foreach ($files as $localName => $remotePath) {
    $localPath = public_path($localName);
    if (file_exists($localPath)) {
        echo "Uploading $localName to $remotePath...\n";
        $success = Storage::disk('s3')->put($remotePath, file_get_contents($localPath), [
            'visibility' => 'public',
            'ContentType' => 'image/png'
        ]);
        echo $success ? "SUCCESS\n" : "FAILED\n";
    } else {
        echo "Local file $localName not found!\n";
    }
}
