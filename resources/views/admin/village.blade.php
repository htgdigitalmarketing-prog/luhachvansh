@extends('admin.layout')

@section('content')

<link href="{{asset('backend/vendors/datatables.net-bs4/css/dataTables.bootstrap4.css')}}" rel="stylesheet">

<main class="c-main">

    <div class="container-fluid">
    <div class="fade-in">
    <div class="card">
    <div class="card-header"> Village History
    </div>
    <div class="card-body">
    <table class="table table-striped table-bordered datatable">
    <thead>
    <tr>
    
    <th>Sr. No.</th>
    <th>State</th>
    <th>District</th>
    <th>Village</th>
    <th>Actions</th>
    </tr>
    </thead>
    <tbody>
        @foreach ($get_data as $key=>$data)
    <tr>
        
        <td>{{$key+1}}</td>
        <td>{{$data->state}}</td>
        <td>{{$data->district}}</td>
        <td>{{$data->village}}</td>
        <td>
            <a class="btn btn-info" href="{{url('village/update/'.$data->id)}}">Update Description</a>
            @if ($data->description)
                <a class="btn btn-info" href="{{url('village/gallery/'.$data->id)}}">Update Gallery</a>
            @endif
        </td>
    </tr>
    @endforeach
    </tbody>
    </table>
   
    </main>

<script src="{{asset('backend/vendors/jquery/js/jquery.slim.min.j')}}s"></script>
<script src="{{asset('backend/vendors/datatables.net/js/jquery.dataTables.js')}}"></script>
<script src="{{asset('backend/vendors/datatables.net-bs4/js/dataTables.bootstrap4.min.js')}}"></script>
<script src="{{asset('backend/js/datatables.js')}}"></script>
@endsection