<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ColetaCompensacao extends Model
{
    protected $table = 'coleta_compensacao';
    protected $primaryKey = 'id_coleta_compensacao';
    public $timestamps = false;

    protected $fillable = [
        'id_coleta',
        'id_tipo',
        'quantidade',
        'valor_unitario',
        'observacao',
        'data_registro',
        // 'valor_total' é calculado por trigger → não incluir como fillable
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

    public function tipo()
    {
        return $this->belongsTo(TipoCompensacao::class, 'id_tipo', 'id_tipo');
    }
}