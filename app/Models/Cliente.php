<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    protected $table = 'cliente';
    protected $primaryKey = 'id_cliente';
    public $timestamps = false;

    protected $fillable = [
        'razao_social',
        'nome_fantasia',
        'cnpj_cpf',
        'endereco',
        'numero',
        'bairro',
        'cidade',
        'estado',
        'cep',
        'nome_responsavel',
        'email_comercial',
        'telefone_celular',
        'telefone_fixo',
        'dias_funcionamento',
        'observacoes',
        'status',
        'data_criacao',
        'data_atualizacao',
    ];

    protected $casts = [
        'data_criacao'     => 'datetime',
        'data_atualizacao' => 'datetime',
    ];

    // Relacionamentos
    public function coletas()
    {
        return $this->hasMany(Coleta::class, 'id_cliente', 'id_cliente');
    }

    public function contratos()
    {
        return $this->hasMany(Contrato::class, 'id_cliente', 'id_cliente');
    }
}