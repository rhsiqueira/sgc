<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Produto extends Model
{
    protected $table = 'produto';
    protected $primaryKey = 'id_produto';
    public $timestamps = false;

    protected $fillable = [
        'nome_produto',
        'unidade',
        'quantidade_atual',
        'quantidade_minima',
        'valor_custo',
        'valor_venda',
        'status',
        'data_atualizacao',
    ];

    protected $casts = [
        'quantidade_atual'  => 'int',       // decimal(10,0) com checks → inteiro
        'quantidade_minima' => 'int',       // idem
        'valor_custo'       => 'decimal:2',
        'valor_venda'       => 'decimal:2',
        'data_atualizacao'  => 'datetime',
    ];

    public function coletasProduto()
    {
        return $this->hasMany(ColetaProduto::class, 'id_produto', 'id_produto');
    }

    public function movimentacoes()
    {
        return $this->hasMany(MovimentacaoEstoque::class, 'id_produto', 'id_produto');
    }

    public function pedidos()
    {
        return $this->hasMany(PedidoCompra::class, 'id_produto', 'id_produto');
    }
}