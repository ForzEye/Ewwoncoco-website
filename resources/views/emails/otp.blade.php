<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kode Verifikasi Ewwon Coco</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f4f7f6;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f4f7f6;
            padding-bottom: 40px;
        }
        .main {
            background-color: #ffffff;
            margin: 0 auto;
            width: 100%;
            max-width: 600px;
            border-spacing: 0;
            color: #2d3748;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #008B5E 0%, #00C48C 100%);
            padding: 40px 20px;
            text-align: center;
        }
        .logo-text {
            color: #ffffff;
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -1px;
            margin: 0;
            text-transform: uppercase;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        h1 {
            font-size: 24px;
            color: #1a202c;
            margin-bottom: 16px;
        }
        p {
            font-size: 16px;
            line-height: 1.6;
            color: #4a5568;
            margin-bottom: 24px;
        }
        .otp-container {
            background-color: #f0faf6;
            border: 2px dashed #00C48C;
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0;
            display: inline-block;
            min-width: 200px;
        }
        .otp-code {
            font-size: 42px;
            font-weight: 800;
            color: #008B5E;
            letter-spacing: 12px;
            margin: 0;
            padding-left: 12px; /* Offset for letter spacing */
        }
        .validity {
            font-size: 14px;
            color: #718096;
            margin-top: 8px;
        }
        .divider {
            height: 1px;
            background-color: #edf2f7;
            margin: 30px 0;
        }
        .security-note {
            background-color: #fffaf0;
            border-left: 4px solid #ed8936;
            padding: 16px;
            text-align: left;
            font-size: 14px;
            color: #744210;
            border-radius: 4px;
        }
        .footer {
            text-align: center;
            padding: 30px;
            font-size: 12px;
            color: #a0aec0;
        }
        .social-links {
            margin-bottom: 16px;
        }
        .social-links a {
            color: #008B5E;
            text-decoration: none;
            margin: 0 10px;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <center class="wrapper">
        <table class="main" width="100%">
            <!-- Header -->
            <tr>
                <td class="header">
                    <p class="logo-text">🥥 EWWON COCO</p>
                </td>
            </tr>
            
            <!-- Body -->
            <tr>
                <td class="content">
                    <h1>Verifikasi Akun Anda</h1>
                    <p>Halo,</p>
                    <p>Terima kasih telah bergabung dengan Ewwon Coco. Gunakan kode keamanan berikut untuk menyelesaikan proses verifikasi Anda:</p>
                    
                    <div class="otp-container">
                        <div class="otp-code">{{ $code }}</div>
                        <div class="validity">Berlaku selama 5 menit</div>
                    </div>
                    
                    <div class="security-note">
                        <strong>⚠️ Keamanan Akun:</strong> Jangan pernah membagikan kode ini kepada siapapun. Tim Ewwon Coco tidak akan pernah meminta kode OTP Anda melalui telepon atau chat.
                    </div>
                    
                    <div class="divider"></div>
                    
                    <p style="font-size: 14px;">Jika Anda tidak merasa melakukan pendaftaran, Anda dapat mengabaikan email ini dengan aman.</p>
                </td>
            </tr>
            
            <!-- Footer -->
            <tr>
                <td class="footer">
                    <div class="social-links">
                        <a href="#">Instagram</a>
                        <a href="#">WhatsApp</a>
                        <a href="#">Website</a>
                    </div>
                    <p>&copy; {{ date('Y') }} Ewwon Coco. Nikmati Kesegaran Alami Setiap Hari.<br>
                    Jl. Raya Ewwon No. 123, Indonesia</p>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>
