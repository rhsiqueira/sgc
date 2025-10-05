<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LogAuditoria extends Model
{
    protected $table = 'log_auditoria';
    protected $primaryKey = 'id_log';
    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'tabela_afetada',
        'registro_id',
        'acao',
        'descricao',
        'detalhes',
        'data_hora',
        'data_registro',
    ];

    protected $casts = [
        'detalhes'      => 'array',   // JSON → array
        'data_hora'     => 'datetime',
        'data_registro' => 'datetime',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }
}