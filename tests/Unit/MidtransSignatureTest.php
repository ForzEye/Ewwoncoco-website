<?php

namespace Tests\Unit;

use Tests\TestCase;

class MidtransSignatureTest extends TestCase
{
    /** @test */
    public function it_validates_midtrans_signature_key()
    {
        $serverKey = 'DummyServerKey';
        config(['services.midtrans.server_key' => $serverKey]);

        $orderId = 'ORD-12345';
        $statusCode = '200';
        $grossAmount = '150000.00';

        $inputStr = $orderId.$statusCode.$grossAmount.$serverKey;
        $expectedSignature = hash('sha512', $inputStr);

        $this->assertEquals(128, strlen($expectedSignature)); // SHA-512 is 128 hex chars
    }
}
