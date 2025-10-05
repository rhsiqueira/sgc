<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TipoCompensacao;
use Illuminate\Validation\ValidationException;

class TipoCompensacaoController extends Controller
{
    public function index()
    {
        return response()->json(['status'=>'success','data'=>TipoCompensacao::all()]);
    }

    public function show($id)
    {
        $tipo = TipoCompensacao::find($id);
        if(!$tipo) return response()->json(['status'=>'error','message'=>'Tipo de compensação não encontrado.'],404);
        return response()->json(['status'=>'success','data'=>$tipo]);
    }

    public function store(Request $request)
    {
        try {
            $dados = $request->validate([
                'nome_compensacao' => 'required|string|max:50|unique:tipo_compensacao,nome_compensacao',
                'descricao' => 'nullable|string|max:150'
            ]);
            $tipo = TipoCompensacao::create($dados);
            return response()->json(['status'=>'success','message'=>'Tipo de compensação criado.','data'=>$tipo],201);
        } catch (ValidationException $e) {
            return response()->json(['status'=>'error','message'=>'Erro de validação.','errors'=>$e->errors()],422);
        }
    }

    public function update(Request $request, $id)
    {
        $tipo = TipoCompensacao::find($id);
        if(!$tipo) return response()->json(['status'=>'error','message'=>'Tipo de compensação não encontrado.'],404);

        try {
            $dados = $request->validate([
                'nome_compensacao' => 'sometimes|required|string|max:50|unique:tipo_compensacao,nome_compensacao,'.$id.',id_tipo',
                'descricao' => 'nullable|string|max:150'
            ]);
            $tipo->update($dados);
            return response()->json(['status'=>'success','message'=>'Tipo de compensação atualizado.','data'=>$tipo]);
        } catch (ValidationException $e) {
            return response()->json(['status'=>'error','message'=>'Erro de validação.','errors'=>$e->errors()],422);
        }
    }

    public function destroy($id)
    {
        $tipo = TipoCompensacao::find($id);
        if(!$tipo) return response()->json(['status'=>'error','message'=>'Tipo de compensação não encontrado.'],404);
        $tipo->delete();
        return response()->json(['status'=>'success','message'=>'Tipo de compensação excluído.']);
    }
}