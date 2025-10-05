<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Relatorio;

class RelatorioController extends Controller
{
    public function index()
    {
        return response()->json(['status'=>'success','data'=>Relatorio::all()]);
    }

    // Aqui você pode criar endpoints customizados depois, ex: gerar PDF, estatísticas etc.
}