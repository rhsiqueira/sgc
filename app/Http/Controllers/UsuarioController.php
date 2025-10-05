<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Usuario;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Usuários listados com sucesso.',
            'data' => Usuario::all()
        ]);
    }

    public function show($id)
    {
        $usuario = Usuario::find($id);
        if (!$usuario) {
            return response()->json(['status'=>'error','message'=>'Usuário não encontrado.'],404);
        }
        return response()->json(['status'=>'success','message'=>'Usuário encontrado.','data'=>$usuario]);
    }

    public function store(Request $request)
    {
        try {
            $dados = $request->validate([
                'nome_completo' => 'required|string|max:100',
                'email' => 'required|email|max:100|unique:usuario,email',
                'cpf' => 'nullable|string|max:14|unique:usuario,cpf',
                'senha_hash' => 'required|string|min:6',
                'id_perfil' => 'required|integer|exists:perfil,id_perfil',
                'status' => 'nullable|in:ATIVO,INATIVO'
            ]);

            $dados['senha_hash'] = Hash::make($dados['senha_hash']);

            $usuario = Usuario::create($dados);
            return response()->json(['status'=>'success','message'=>'Usuário criado.','data'=>$usuario],201);

        } catch (ValidationException $e) {
            return response()->json(['status'=>'error','message'=>'Erro de validação.','errors'=>$e->errors()],422);
        }
    }

    public function update(Request $request, $id)
    {
        $usuario = Usuario::find($id);
        if (!$usuario) {
            return response()->json(['status'=>'error','message'=>'Usuário não encontrado.'],404);
        }

        try {
            $dados = $request->validate([
                'nome_completo' => 'sometimes|required|string|max:100',
                'email' => 'sometimes|required|email|max:100|unique:usuario,email,' . $id . ',id_usuario',
                'cpf' => 'nullable|string|max:14|unique:usuario,cpf,' . $id . ',id_usuario',
                'senha_hash' => 'nullable|string|min:6',
                'id_perfil' => 'sometimes|required|integer|exists:perfil,id_perfil',
                'status' => 'nullable|in:ATIVO,INATIVO'
            ]);

            if(isset($dados['senha_hash'])) $dados['senha_hash'] = Hash::make($dados['senha_hash']);

            $usuario->update($dados);

            return response()->json(['status'=>'success','message'=>'Usuário atualizado.','data'=>$usuario]);

        } catch (ValidationException $e) {
            return response()->json(['status'=>'error','message'=>'Erro de validação.','errors'=>$e->errors()],422);
        }
    }

    public function destroy($id)
    {
        $usuario = Usuario::find($id);
        if(!$usuario) return response()->json(['status'=>'error','message'=>'Usuário não encontrado.'],404);
        $usuario->delete();
        return response()->json(['status'=>'success','message'=>'Usuário excluído.']);
    }
}