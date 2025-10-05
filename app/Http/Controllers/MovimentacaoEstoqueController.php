<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MovimentacaoEstoque;
use Illuminate\Validation\ValidationException;

class MovimentacaoEstoqueController extends Controller
{
    public function index()
    {
        return response()->json(['status'=>'success','data'=>MovimentacaoEstoque::all()]);
    }

    public function show($id)
    {
        $mov = MovimentacaoEstoque::find($id);
        if(!$mov) return response()->json(['status'=>'error','message'=>'Movimentação não encontrada.'],404);
        return response()->json(['status'=>'success','data'=>$mov]);
    }

    public function store(Request $request)
    {
        try {
            $dados = $request->validate([
                'id_produto' => 'required|integer|exists:produto,id_produto',
                'tipo' => 'required|in:ENTRADA,SAIDA',
                'quantidade' => 'required|numeric|min:0',
                'origem' => 'nullable|in:COMPRA,COLETA,AJUSTE',
                'id_coleta' => 'nullable|integer|exists:coleta,id_coleta',
                'observacao' => 'nullable|string|max:255'
            ]);

            $mov = MovimentacaoEstoque::create($dados);
            return response()->json(['status'=>'success','message'=>'Movimentação registrada.','data'=>$mov],201);
        } catch (ValidationException $e) {
            return response()->json(['status'=>'error','errors'=>$e->errors()],422);
        }
    }

    public function update(Request $request, $id)
    {
        $mov = MovimentacaoEstoque::find($id);
        if(!$mov) return response()->json(['status'=>'error','message'=>'Movimentação não encontrada.'],404);

        try {
            $dados = $request->validate([
                'tipo' => 'sometimes|required|in:ENTRADA,SAIDA',
                'quantidade' => 'sometimes|required|numeric|min:0',
                'origem' => 'nullable|in:COMPRA,COLETA,AJUSTE',
                'observacao' => 'nullable|string|max:255'
            ]);
            $mov->update($dados);
            return response()->json(['status'=>'success','message'=>'Movimentação atualizada.','data'=>$mov]);
        } catch (ValidationException $e) {
            return response()->json(['status'=>'error','errors'=>$e->errors()],422);
        }
    }

    public function destroy($id)
    {
        $mov = MovimentacaoEstoque::find($id);
        if(!$mov) return response()->json(['status'=>'error','message'=>'Movimentação não encontrada.'],404);
        $mov->delete();
        return response()->json(['status'=>'success','message'=>'Movimentação excluída.']);
    }
}