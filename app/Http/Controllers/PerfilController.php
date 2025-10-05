<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Perfil;
use Illuminate\Validation\ValidationException;

class PerfilController extends Controller
{
    public function index()
    {
        return response()->json(['status'=>'success','data'=>Perfil::all()]);
    }

    public function show($id)
    {
        $perfil = Perfil::find($id);
        if(!$perfil) return response()->json(['status'=>'error','message'=>'Perfil não encontrado.'],404);
        return response()->json(['status'=>'success','data'=>$perfil]);
    }

    public function store(Request $request)
    {
        try {
            $dados = $request->validate([
                'nome_perfil' => 'required|string|max:50|unique:perfil,nome_perfil',
                'descricao' => 'nullable|string|max:250'
            ]);

            $perfil = Perfil::create($dados);
            return response()->json(['status'=>'success','message'=>'Perfil criado.','data'=>$perfil],201);
        } catch (ValidationException $e) {
            return response()->json(['status'=>'error','message'=>'Erro de validação.','errors'=>$e->errors()],422);
        }
    }

    public function update(Request $request, $id)
    {
        $perfil = Perfil::find($id);
        if(!$perfil) return response()->json(['status'=>'error','message'=>'Perfil não encontrado.'],404);

        try {
            $dados = $request->validate([
                'nome_perfil' => 'sometimes|required|string|max:50|unique:perfil,nome_perfil,'.$id.',id_perfil',
                'descricao' => 'nullable|string|max:250'
            ]);
            $perfil->update($dados);
            return response()->json(['status'=>'success','message'=>'Perfil atualizado.','data'=>$perfil]);
        } catch (ValidationException $e) {
            return response()->json(['status'=>'error','message'=>'Erro de validação.','errors'=>$e->errors()],422);
        }
    }

    public function destroy($id)
    {
        $perfil = Perfil::find($id);
        if(!$perfil) return response()->json(['status'=>'error','message'=>'Perfil não encontrado.'],404);
        $perfil->delete();
        return response()->json(['status'=>'success','message'=>'Perfil excluído.']);
    }
}