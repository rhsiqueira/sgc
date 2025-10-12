<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ColetaProduto;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class ColetaProdutoController extends Controller
{
    public function index()
    {
        return response()->json(['status'=>'success','data'=>ColetaProduto::all()]);
    }

    public function show($id)
    {
        $registro = ColetaProduto::find($id);
        if(!$registro) return response()->json(['status'=>'error','message'=>'Registro não encontrado.'],404);
        return response()->json(['status'=>'success','data'=>$registro]);
    }

    public function store(Request $request)
    {
        try {
        
            $dados = $request->validate([
                'id_coleta' => 'required|integer|exists:coleta,id_coleta',
                'id_produto' => 'required|integer|exists:produto,id_produto',
                'quantidade' => 'required|numeric|min:0',
                'valor_unitario' => 'nullable|numeric|min:0'
            ]);

            $dados['valor_total'] = ($dados['valor_unitario'] ?? 0) * $dados['quantidade'];

            $registro = ColetaProduto::create($dados);
            return response()->json(['status'=>'success','message'=>'Produto vinculado à coleta.','data'=>$registro],201);
        } catch (ValidationException $e) {
            return response()->json(['status'=>'error','errors'=>$e->errors()],422);
        }
    }

    public function update(Request $request, $id)
    {
        $registro = ColetaProduto::find($id);
        if(!$registro) return response()->json(['status'=>'error','message'=>'Registro não encontrado.'],404);

        try {
            DB::statement('SET @current_user_id = 4');

            $dados = $request->validate([
                'quantidade' => 'sometimes|required|numeric|min:0',
                'valor_unitario' => 'nullable|numeric|min:0'
            ]);

            if(isset($dados['quantidade']) || isset($dados['valor_unitario'])) {
                $dados['valor_total'] = ($dados['valor_unitario'] ?? $registro->valor_unitario) * ($dados['quantidade'] ?? $registro->quantidade);
            }

            $registro->update($dados);
            return response()->json(['status'=>'success','message'=>'Registro atualizado.','data'=>$registro]);
        } catch (ValidationException $e) {
            return response()->json(['status'=>'error','errors'=>$e->errors()],422);
        }
    }

    public function destroy($id)
    {
        $registro = ColetaProduto::find($id);
        if(!$registro) return response()->json(['status'=>'error','message'=>'Registro não encontrado.'],404);

        DB::statement('SET @current_user_id = 4');
        $registro->delete();
        return response()->json(['status'=>'success','message'=>'Produto removido da coleta.']);
    }
}