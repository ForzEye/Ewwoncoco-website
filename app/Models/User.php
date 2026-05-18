<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'merchant_id',
        'avatar_url',
        'google_id',
        'is_active',
        'fcm_token',
        'referral_code',
        'referred_by_id',
        'gender',
        'birth_date',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'google_id',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_active'         => 'boolean',
            'birth_date'        => 'date',
        ];
    }

    // ─── Role helpers ───

    public function isSuperAdmin(): bool { return $this->role === 'super_admin'; }
    public function isAdmin(): bool      { return $this->role === 'admin'; }
    public function isKasir(): bool      { return $this->role === 'kasir'; }
    public function isCustomer(): bool   { return $this->role === 'customer'; }
    public function isStaff(): bool      { return in_array($this->role, ['admin', 'kasir', 'super_admin']); }

    // ─── Relationships ───

    public function otpCodes(): HasMany
    {
        return $this->hasMany(OtpCode::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'customer_id');
    }

    public function loyaltyPoints(): HasMany
    {
        return $this->hasMany(LoyaltyPoint::class, 'customer_id');
    }

    public function posTransactions(): HasMany
    {
        return $this->hasMany(PosTransaction::class, 'cashier_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'customer_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function merchant()
    {
        return $this->belongsTo(Merchant::class, 'merchant_id');
    }

    public function ownedMerchant()
    {
        return $this->hasOne(Merchant::class, 'owner_id');
    }
}
