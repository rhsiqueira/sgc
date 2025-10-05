<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PedidoCompra;
use Illuminate\Validation\ValidationException;

class PedidoCompraController extends Controller
{
    public function index()
    {
        return response()->json(['status'=>'success','data'=>PedidoCompra::all()]);
    }

    public function show($id)
    {
        $pedido = PedidoCompra::find($id);
        if(!$pedido) return response()->json(['status'=>'error','message'=>'Pedido não encontrado.'],404);
        return response()->json(['status'=>'success','data'=>$pedido]);
    }

    public function store(Request $request)
    {
        try {
            $dados = $request->validate([
                'id_produto' => 'required|integer|exists:produto,id_produto',
                'quantidade_solicitada' => 'required|numeric|min:1',
                'status' => 'nullable|in:PENDENTE,APROVADO,RECEBIDO,CANCELADO',
                'observacao' => 'nullable|string|max:255'
            ]);

            $pedido = PedidoCompra::create($dados);
            return response()->json(['status'=>'success','message'=>'Pedido criado.','data'=>$pedido],201);
        } catch (ValidationException $e) {
            return response()->json(['status'=>'error','errors'=>$e->errors()],422);
        }
    }

    public function update(Request $request, $id)
    {
        $pedido = PedidoCompra::find($id);
        if(!$pedido) return response()->json(['status'=>'error','message'=>'Pedido não encontrado.'],404);

        try {
            $dados = $request->validate([
                'quantidade_solicitada' => 'sometimes|required|numeric|min:1',
                'status' => 'nullable|in:PENDENTE,APROVADO,RECEBIDO,CANCELADO',
                'observacao' => 'nullable|string|max:255'
            ]);

            $pedido->update($dados);
            return response()->json(['status'=>'success','message'=>'Pedido atualizado.','data'=>$pedido]);
        } catch (ValidationException $e) {
            return response()->json(['status'=>'error','errors'=>$e->errors()],422);
        }
    }

    public function destroy($id)
    {
        $pedido = PedidoCompra::find($id);
        if(!$pedido) return response()->json(['status'=>'error','message'=>'Pedido não encontrado.'],404);
        $pedido->delete();
        return response()->json(['status'=>'success','message'=>'Pedido excluído.']);
    }
}