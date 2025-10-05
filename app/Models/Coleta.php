<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coleta extends Model
{
    protected $table = 'coleta';
    protected $primaryKey = 'id_coleta';
    public $timestamps = false;

    protected $fillable = [
        'id_cliente',
        'id_usuario',
        'data_coleta',
        'quantidade_total',
        'status',
        'observacao',
        'data_criacao',
        'data_atualizacao',
    ];

    protected $casts = [
        'data_coleta'      => 'date',
        'quantidade_total' => 'decimal:2',
        'data_criacao'     => 'datetime',
        'data_atualizacao' => 'datetime',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'id_cliente', 'id_cliente');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    public function compensacoes()
    {
        return $this->hasMany(ColetaCompensacao::class, 'id_coleta', 'id_coleta');
    }

    public function produtos()
    {
        return $this->hasMany(ColetaProduto::class, 'id_coleta', 'id_coleta');
    }

    public function movimentacoesEstoque()
    {
        // id_coleta é opcional em movimentacao_estoque
        return $this->hasMany(MovimentacaoEstoque::class, 'id_coleta', 'id_coleta');
    }
}