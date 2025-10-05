<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LogAuditoria;

class LogAuditoriaController extends Controller
{
    public function index()
    {
        return response()->json(['status'=>'success','data'=>LogAuditoria::orderBy('id_log','desc')->get()]);
    }

    public function show($id)
    {
        $log = LogAuditoria::find($id);
        if(!$log) return response()->json(['status'=>'error','message'=>'Log não encontrado.'],404);
        return response()->json(['status'=>'success','data'=>$log]);
    }

    // Logs são somente leitura — sem store/update/destroy
}