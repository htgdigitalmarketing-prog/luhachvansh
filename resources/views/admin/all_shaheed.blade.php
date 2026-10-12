@extends('admin.layout')

@section('content')

<link href="{{asset('backend/vendors/datatables.net-bs4/css/dataTables.bootstrap4.css')}}" rel="stylesheet">

<main class="c-main">

    <div class="container-fluid">
    <div class="fade-in">
    <div class="card">
    <div class="card-header"> Join Us
    </div>
    <div class="card-body">
    <table class="table table-striped table-bordered datatable">
    <thead>
    <tr>
        <th>Sr. No.</th>
        <th>Operation Serial No.</th>
        <th>Opertaion</th>
        <th>Army No.</th>
        <th>Post</th>
        <th>Name</th>
        <th>Father Name</th>
        <th>Unit</th>
        <th>Village</th>
        <th>District</th>
        <th>State</th>
        <th>Military / Paramilitary</th>
        <th>Actions</th>
    </tr>
    </thead>
    <tbody>
        @foreach ($get_data as $key=>$data)
    <tr>
        
        <td>{{$key+1}}</td>
        <td>{{$data->operation_sr_no}}</td>
        <td>{{$data->operation}}</td>
        <td>{{$data->army_no}}</td>
        <td>{{$data->post}}</td>
        <td>{{$data->name}}</td>
        <td>{{$data->father_name}}</td>
        <td>{{$data->unit}}</td>
        <td>{{$data->village}}</td>
        <td>{{$data->district}}</td>
        <td>{{$data->state}}</td>
        <td>{{$data->military_status}}</td>
        <td>
            <a class="btn btn-info" href="{{url('all_shaheed/edit/'.$data->id)}}">Edit</a>
            <a class="btn btn-danger" href="{{url('all_shaheed/delete/'.$data->id)}}">Delete</a>
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