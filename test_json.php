<?php
$p = App\Models\Product::find(1);
echo json_encode($p->toArray(), JSON_PRETTY_PRINT);
