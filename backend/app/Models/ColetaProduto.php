<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ColetaProduto extends Model
{
    protected $table = 'coleta_produto';
    protected $primaryKey = 'id_coleta_produto';
    public $timestamps = false;

    protected $fillable = [
        'id_coleta',
        'id_produto',
        'quantidade',
        'valor_unitario',
        'data_registro',
        // 'valor_total' é coluna gerada STORED → não incluir como fillable
    ];

    protected $casts = [
        'quantidade'    => 'decimal:2',
        'valor_unitario'=> 'decimal:2',
        'valor_total'   => 'decimal:2',
        'data_registro' => 'datetime',
    ];

    public function coleta()
    {
        return $this->belongsTo(Coleta::class, 'id_coleta', 'id_coleta');
    }

    public function produto()
    {
        return $this->belongsTo(Produto::class, 'id_produto', 'id_produto');
    }
}