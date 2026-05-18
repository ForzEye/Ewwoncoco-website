<?php

namespace App\Http\Controllers;

use App\Models\ChatRoom;
use App\Models\ChatMessage;
use App\Models\Merchant;
use App\Events\MessageSent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ChatController extends Controller
{
    /**
     * List chat rooms for current user
     */
    public function index()
    {
        $user = \Illuminate\Support\Facades\Auth::user();
        $rooms = [];

        if ($user->role === 'customer') {
            $rooms = ChatRoom::with('merchant')
                ->where('customer_id', $user->id)
                ->orderBy('last_message_at', 'desc')
                ->get();
        } else {
            // Admin/Merchant sees rooms for their merchant
            $merchant = $user->merchant ?? $user->ownedMerchant;
            if (!$merchant) {
                return Inertia::render('Chat/Index', ['rooms' => []]);
            }
            $rooms = ChatRoom::with('customer')
                ->where('merchant_id', $merchant->id)
                ->orderBy('last_message_at', 'desc')
                ->get();
        }

        return Inertia::render('Chat/Index', [
            'rooms' => $rooms
        ]);
    }

    /**
     * Open or create a chat room with a merchant
     */
    public function openRoom(Request $request, $merchantId)
    {
        $merchant = Merchant::findOrFail($merchantId);
        $user = \Illuminate\Support\Facades\Auth::user();

        $room = ChatRoom::firstOrCreate([
            'customer_id' => $user->id,
            'merchant_id' => $merchant->id
        ]);

        return redirect()->route('chat.show', $room->id);
    }

    /**
     * Show chat room details (messages)
     */
    public function show($id)
    {
        $room = ChatRoom::with(['customer', 'merchant'])->findOrFail($id);
        
        // Security Check
        $user = \Illuminate\Support\Facades\Auth::user();
        if ($user->role === 'customer' && $room->customer_id !== $user->id) abort(403);
        if ($user->role !== 'customer') {
            $merchant = $user->merchant ?? $user->ownedMerchant;
            if (!$merchant || $room->merchant_id !== $merchant->id) abort(403);
        }

        $messages = ChatMessage::with('sender:id,name,avatar_url')
            ->where('chat_room_id', $room->id)
            ->oldest()
            ->get();

        return Inertia::render('Chat/ChatRoom', [
            'room' => $room,
            'messages' => $messages
        ]);
    }

    /**
     * Send message
     */
    public function sendMessage(Request $request, $id)
    {
        $request->validate(['message' => 'required|string']);
        
        $room = ChatRoom::findOrFail($id);
        
        $message = ChatMessage::create([
            'chat_room_id' => $room->id,
            'sender_id' => \Illuminate\Support\Facades\Auth::id(),
            'message' => $request->message
        ]);

        $room->update(['last_message_at' => now()]);

        broadcast(new MessageSent($message))->toOthers();

        return response()->json($message->load('sender:id,name,avatar_url'));
    }
}
