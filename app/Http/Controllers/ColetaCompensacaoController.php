<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ColetaCompensacao;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class ColetaCompensacaoController extends Controller
{
    public function index()
    {
        return response()->json(['status'=>'success','data'=>ColetaCompensacao::all()]);
    }

    public function show($id)
    {
        $cc = ColetaCompensacao::find($id);
        if(!$cc) return response()->json(['status'=>'error','message'=>'Registro não encontrado.'],404);
        return response()->json(['status'=>'success','data'=>$cc]);
    }

    public function store(Request $request)
    {
        try {

            $dados = $request->validate([
                'id_coleta' => 'required|integer|exists:coleta,id_coleta',
                'id_tipo' => 'required|integer|exists:tipo_compensacao,id_tipo',
                'quantidade' => 'required|numeric|min:0',
                'valor_unitario' => 'nullable|numeric|min:0',
                'observacao' => 'nullable|string|max:255'
            ]);

            $dados['valor_total'] = ($dados['valor_unitario'] ?? 0) * $dados['quantidade'];

            $cc = ColetaCompensacao::create($dados);
            return response()->json(['status'=>'success','message'=>'Compensação criada.','data'=>$cc],201);
        } catch (ValidationException $e) {
            return response()->json(['status'=>'error','errors'=>$e->errors()],422);
        }
    }

    public function update(Request $request, $id)
    {
        $cc = ColetaCompensacao::find($id);
        if(!$cc) return response()->json(['status'=>'error','message'=>'Registro não encontrado.'],404);

        try {
            DB::statement('SET @current_user_id = 4');

            $dados = $request->validate([
                'quantidade' => 'sometimes|required|numeric|min:0',
                'valor_unitario' => 'nullable|numeric|min:0',
                'observacao' => 'nullable|string|max:255'
            ]);

            if(isset($dados['quantidade']) || isset($dados['valor_unitario'])) {
                $dados['valor_total'] = ($dados['valor_unitario'] ?? $cc->valor_unitario) * ($dados['quantidade'] ?? $cc->quantidade);
            }

            $cc->update($dados);
            return response()->json(['status'=>'success','message'=>'Compensação atualizada.','data'=>$cc]);
        } catch (ValidationException $e) {
            return response()->json(['status'=>'error','errors'=>$e->errors()],422);
        }
    }

    public function destroy($id)
    {
        $cc = ColetaCompensacao::find($id);
        if(!$cc) return response()->json(['status'=>'error','message'=>'Registro não encontrado.'],404);

        DB::statement('SET @current_user_id = 4');
        $cc->delete();
        return response()->json(['status'=>'success','message'=>'Registro excluído.']);
    }
}