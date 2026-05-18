<?php
use App\Models\Product;

$products = Product::whereIn('id', [1,2,3])->get();
foreach ($products as $p) {
    echo "ID " . $p->id . ": " . $p->getAttributes()['image_url'] . "\n";
    echo "Full URL: " . $p->image_url . "\n\n";
}
