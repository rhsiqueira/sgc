<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Coleta;
use Illuminate\Validation\ValidationException;

class ColetaController extends Controller
{
    public function index()
    {
        return response()->json(['status'=>'success','data'=>Coleta::all()]);
    }

    public function show($id)
    {
        $coleta = Coleta::find($id);
        if(!$coleta) return response()->json(['status'=>'error','message'=>'Coleta não encontrada.'],404);
        return response()->json(['status'=>'success','data'=>$coleta]);
    }

    public function store(Request $request)
    {
        try {
            $dados = $request->validate([
                'id_cliente' => 'required|integer|exists:cliente,id_cliente',
                'id_usuario' => 'required|integer|exists:usuario,id_usuario',
                'data_coleta' => 'required|date',
                'quantidade_total' => 'required|numeric|min:0',
                'status' => 'nullable|in:PENDENTE,EM_ANDAMENTO,CONCLUIDA,CANCELADA',
                'observacao' => 'nullable|string|max:255'
            ]);

            $coleta = Coleta::create($dados);
            return response()->json(['status'=>'success','message'=>'Coleta criada.','data'=>$coleta],201);
        } catch (ValidationException $e) {
            return response()->json(['status'=>'error','errors'=>$e->errors()],422);
        }
    }

    public function update(Request $request, $id)
    {
        $coleta = Coleta::find($id);
        if(!$coleta) return response()->json(['status'=>'error','message'=>'Coleta não encontrada.'],404);

        try {
            $dados = $request->validate([
                'id_cliente' => 'sometimes|required|integer|exists:cliente,id_cliente',
                'id_usuario' => 'sometimes|required|integer|exists:usuario,id_usuario',
                'data_coleta' => 'sometimes|required|date',
                'quantidade_total' => 'sometimes|required|numeric|min:0',
                'status' => 'nullable|in:PENDENTE,EM_ANDAMENTO,CONCLUIDA,CANCELADA',
                'observacao' => 'nullable|string|max:255'
            ]);

            $coleta->update($dados);
            return response()->json(['status'=>'success','message'=>'Coleta atualizada.','data'=>$coleta]);
        } catch (ValidationException $e) {
            return response()->json(['status'=>'error','errors'=>$e->errors()],422);
        }
    }

    public function destroy($id)
    {
        $coleta = Coleta::find($id);
        if(!$coleta) return response()->json(['status'=>'error','message'=>'Coleta não encontrada.'],404);
        $coleta->delete();
        return response()->json(['status'=>'success','message'=>'Coleta excluída.']);
    }
}