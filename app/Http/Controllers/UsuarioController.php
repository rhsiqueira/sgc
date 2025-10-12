<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Usuario;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    /**
     * Lista todos os usuários cadastrados.
     * Método GET → /api/usuarios
     */
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Usuários listados com sucesso.',
            'data' => Usuario::all()
        ]);
    }

    /**
     * Exibe um único usuário pelo ID.
     * 
     * Método GET → /api/usuarios/{id}
     */
    public function show($id)
    {
        $usuario = Usuario::find($id);

        if (!$usuario) {
            return response()->json([
                'status' => 'error',
                'message' => 'Usuário não encontrado.'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Usuário encontrado.',
            'data' => $usuario
        ]);
    }

    /**
     * Cria um novo usuário.
     * 
     * Método POST → /api/usuarios
     * 
     * ⚙️ Fluxo:
     *  - Valida os dados enviados
     *  - Criptografa a senha
     *  - Cria o registro no banco
     */
    public function store(Request $request)
    {
        try {
            // 🔍 Validação dos campos obrigatórios
            $dados = $request->validate([
                'nome_completo' => 'required|string|max:100',
                'email' => 'required|email|max:100|unique:usuario,email',
                'cpf' => 'nullable|string|max:14|unique:usuario,cpf',
                'senha' => 'required|string|min:6',
                'id_perfil' => 'required|integer|exists:perfil,id_perfil',
                'status' => 'nullable|in:ATIVO,INATIVO'
            ]);

            // 🔒 Gera o hash da senha antes de salvar no banco
            $dados['senha_hash'] = Hash::make($dados['senha']);

            // Remove o campo "senha" simples, para evitar conflito no create()
            unset($dados['senha']);

            // 🧱 Cria o usuário
            $usuario = Usuario::create($dados);

            // ✅ Retorna resposta de sucesso
            return response()->json([
                'status' => 'success',
                'message' => 'Usuário criado com sucesso.',
                'data' => $usuario
            ], 201);

        } catch (ValidationException $e) {
            // ⚠️ Erros de validação
            return response()->json([
                'status' => 'error',
                'message' => 'Erro de validação.',
                'errors' => $e->errors()
            ], 422);
        }
    }

    /**
     * Atualiza um usuário existente.
     * 
     * Método PUT/PATCH → /api/usuarios/{id}
     * 
     * ⚙️ Fluxo:
     *  - Valida campos enviados
     *  - Se houver nova senha, gera o hash
     *  - Atualiza o registro
     */
    public function update(Request $request, $id)
    {
        $usuario = Usuario::find($id);

        // ❌ Caso não exista
        if (!$usuario) {
            return response()->json([
                'status' => 'error',
                'message' => 'Usuário não encontrado.'
            ], 404);
        }

        try {
            // 🔍 Validação dos campos (parciais, pois nem todos são obrigatórios)
            $dados = $request->validate([
                'nome_completo' => 'sometimes|required|string|max:100',
                'email' => 'sometimes|required|email|max:100|unique:usuario,email,' . $id . ',id_usuario',
                'cpf' => 'nullable|string|max:14|unique:usuario,cpf,' . $id . ',id_usuario',
                'senha' => 'nullable|string|min:6',
                'id_perfil' => 'sometimes|required|integer|exists:perfil,id_perfil',
                'status' => 'nullable|in:ATIVO,INATIVO'
            ]);

            // 🔒 Caso a senha tenha sido enviada, gera o hash
            if (isset($dados['senha'])) {
                $dados['senha_hash'] = Hash::make($dados['senha']);
                unset($dados['senha']);
            }

            // 💾 Atualiza o usuário
            $usuario->update($dados);

            // ✅ Retorna sucesso
            return response()->json([
                'status' => 'success',
                'message' => 'Usuário atualizado com sucesso.',
                'data' => $usuario
            ]);

        } catch (ValidationException $e) {
            // ⚠️ Erros de validação
            return response()->json([
                'status' => 'error',
                'message' => 'Erro de validação.',
                'errors' => $e->errors()
            ], 422);
        }
    }

    /**
     * Exclui um usuário.
     * 
     * Método DELETE → /api/usuarios/{id}
     */
    public function destroy($id)
    {
        $usuario = Usuario::find($id);

        if (!$usuario) {
            return response()->json([
                'status' => 'error',
                'message' => 'Usuário não encontrado.'
            ], 404);
        }

        $usuario->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Usuário excluído com sucesso.'
        ]);
    }
}