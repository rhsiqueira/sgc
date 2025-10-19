<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contrato extends Model
{
    protected $table = 'contrato';
    protected $primaryKey = 'id_contrato';
    public $timestamps = false;

    protected $fillable = [
        'id_cliente',
        'url_arquivo',
        'usuario_upload',
        'data_upload',
        'data_alteracao',
    ];

    protected $casts = [
        'data_upload'   => 'datetime',
        'data_alteracao'=> 'datetime',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'id_cliente', 'id_cliente');
    }
}