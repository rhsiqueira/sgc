<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Produto;
use Illuminate\Validation\ValidationException;

class ProdutoController extends Controller
{
    public function index()
    {
        return response()->json(['status'=>'success','data'=>Produto::all()]);
    }

    public function show($id)
    {
        $p = Produto::find($id);
        if(!$p) return response()->json(['status'=>'error','message'=>'Produto não encontrado.'],404);
        return response()->json(['status'=>'success','data'=>$p]);
    }

    public function store(Request $request)
    {
        try {
            $dados = $request->validate([
                'nome_produto' => 'required|string|max:100|unique:produto,nome_produto',
                'unidade' => 'nullable|string|max:20',
                'quantidade_atual' => 'required|numeric|min:0',
                'quantidade_minima' => 'required|numeric|min:0',
                'valor_custo' => 'required|numeric|min:0',
                'valor_venda' => 'required|numeric|min:0',
                'status' => 'nullable|in:ATIVO,INATIVO'
            ]);

            $produto = Produto::create($dados);
            return response()->json(['status'=>'success','message'=>'Produto criado.','data'=>$produto],201);
        } catch (ValidationException $e) {
            return response()->json(['status'=>'error','message'=>'Erro de validação.','errors'=>$e->errors()],422);
        }
    }

    public function update(Request $request, $id)
    {
        $p = Produto::find($id);
        if(!$p) return response()->json(['status'=>'error','message'=>'Produto não encontrado.'],404);

        try {
            $dados = $request->validate([
                'nome_produto' => 'sometimes|required|string|max:100|unique:produto,nome_produto,'.$id.',id_produto',
                'unidade' => 'nullable|string|max:20',
                'quantidade_atual' => 'sometimes|required|numeric|min:0',
                'quantidade_minima' => 'sometimes|required|numeric|min:0',
                'valor_custo' => 'sometimes|required|numeric|min:0',
                'valor_venda' => 'sometimes|required|numeric|min:0',
                'status' => 'nullable|in:ATIVO,INATIVO'
            ]);
            $p->update($dados);
            return response()->json(['status'=>'success','message'=>'Produto atualizado.','data'=>$p]);
        } catch (ValidationException $e) {
            return response()->json(['status'=>'error','message'=>'Erro de validação.','errors'=>$e->errors()],422);
        }
    }

    public function destroy($id)
    {
        $p = Produto::find($id);
        if(!$p) return response()->json(['status'=>'error','message'=>'Produto não encontrado.'],404);
        $p->delete();
        return response()->json(['status'=>'success','message'=>'Produto excluído.']);
    }
}