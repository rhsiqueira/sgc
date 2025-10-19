<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Relatorio extends Model
{
    protected $table = 'relatorio';
    public $timestamps = false;

    // Tabela auxiliar temporária, sem PK formal e só com 'id_temp' no dump
    protected $fillable = [
        'id_temp',
    ];
}