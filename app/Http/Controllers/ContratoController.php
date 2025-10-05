<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Contrato;
use Illuminate\Validation\ValidationException;

class ContratoController extends Controller
{
    public function index()
    {
        return response()->json(['status'=>'success','data'=>Contrato::all()]);
    }

    public function show($id)
    {
        $contrato = Contrato::find($id);
        if(!$contrato) return response()->json(['status'=>'error','message'=>'Contrato não encontrado.'],404);
        return response()->json(['status'=>'success','data'=>$contrato]);
    }

    public function store(Request $request)
    {
        try {
            $dados = $request->validate([
                'id_cliente' => 'required|integer|exists:cliente,id_cliente',
                'url_arquivo' => 'required|string|max:255',
                'usuario_upload' => 'nullable|string|max:100'
            ]);

            $contrato = Contrato::create($dados);
            return response()->json(['status'=>'success','message'=>'Contrato criado.','data'=>$contrato],201);
        } catch (ValidationException $e) {
            return response()->json(['status'=>'error','errors'=>$e->errors()],422);
        }
    }

    public function update(Request $request, $id)
    {
        $contrato = Contrato::find($id);
        if(!$contrato) return response()->json(['status'=>'error','message'=>'Contrato não encontrado.'],404);

        try {
            $dados = $request->validate([
                'url_arquivo' => 'sometimes|required|string|max:255',
                'usuario_upload' => 'nullable|string|max:100'
            ]);

            $contrato->update($dados);
            return response()->json(['status'=>'success','message'=>'Contrato atualizado.','data'=>$contrato]);
        } catch (ValidationException $e) {
            return response()->json(['status'=>'error','errors'=>$e->errors()],422);
        }
    }

    public function destroy($id)
    {
        $contrato = Contrato::find($id);
        if(!$contrato) return response()->json(['status'=>'error','message'=>'Contrato não encontrado.'],404);
        $contrato->delete();
        return response()->json(['status'=>'success','message'=>'Contrato excluído.']);
    }
}