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
    
    <th>Name</th>
    <th>Father Name</th>
    <th>Profession</th>
    <th>Photo</th>
    <th>Belong From</th>
    <th>Achieve</th>
    <th>Birth Place</th>
    <th>City</th>
    <th>District</th>
    <th>State</th>
    <th>Actions</th>
    </tr>
    </thead>
    <tbody>
        @foreach ($get_data as $key=>$data)
    <tr>
        
        <td>{{$data->name}}</td>
        <td>{{$data->father_name}}</td>
        <td>{{$data->profession}}</td>
        <td><img src="{{$data->photo}}"  height="50px;" width="100px;" alt="photo"></td>
        <td>{{$data->belong_from}}</td>
        <td>{{$data->achievements}}</td>
        <td>{{$data->birth_place}}</td>
        <td>{{$data->current_city}}</td>
        <td>{{$data->current_district}}</td>
        <td>{{$data->state}}</td>
        <td>
            <a class="btn btn-info" href="{{url('all_member/edit/'.$data->id)}}">Edit</a>
            <a class="btn btn-danger" href="{{url('all_member/delete/'.$data->id)}}">Delete</a>
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