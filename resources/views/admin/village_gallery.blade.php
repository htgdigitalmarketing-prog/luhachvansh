@extends('admin.layout')

@section('content')

<link href="{{asset('backend/vendors/datatables.net-bs4/css/dataTables.bootstrap4.css')}}" rel="stylesheet">

<main class="c-main">
    <div class="container-fluid">
        <div class="fade-in">
            <div class="row">
            <div class="col-md-12">
            <div class="card">
                <div class="card-body"><h1>Village Gallery</h1>
            <hr>
            <div class="row">
            <div class="col-md-6">
                <form id="signupForm" method="POST" action="{{route('store_village_gallery')}}" enctype="multipart/form-data">
                    @csrf
                    <div class="form-group">
                    <label class="col-form-label" for="firstname">Village Gallery</label>
                    <input type="hidden" name="id" value="{{$get_data->village_id}}">
                    <input type="hidden" name="state" value="{{$get_data->state}}">
                    <input type="hidden" name="district" value="{{$get_data->district}}">
                    <input type="hidden" name="village" value="{{$get_data->village}}">
                        <input class="form-control" type="file" name="images" accept="image/png, image/jpeg" placeholder="Select Image To Upload">
                        <br>
                    </div>
                    </div>
                    </div>
                    <div class="form-group">
                        <button class="btn btn-primary" type="submit" name="signup" value="Submit">Submit</button>
                    </div>
                </form>
            </div>
            </div>
            </div>
            </div>
    </div>

    <div class="container-fluid">
    <div class="fade-in">
    <div class="card">
    <div class="card-header"> All News
    </div>
    <div class="card-body">
    <table class="table table-striped table-bordered datatable">
    <thead>
    <tr>
    <th>Sr. No.</th>
    <th>Images</th>
    <th>Actions</th>
    </tr>
    </thead>
    <tbody>
        @foreach ($get_gallery as $key=>$data)
    <tr>
        <td>{{$key+1}}</td>
        <td><img src="{{asset($data->image_path)}}" width="100" height="auto" alt="#"></td>
        <td>
            <a class="btn btn-danger" href="{{url('village/gallery/delete/'.$data->id)}}">Delete</a>
        </td>
    </tr>
    @endforeach
   
    </main>

<script src="{{asset('backend/vendors/jquery/js/jquery.slim.min.j')}}s"></script>
<script src="{{asset('backend/vendors/datatables.net/js/jquery.dataTables.js')}}"></script>
<script src="{{asset('backend/vendors/datatables.net-bs4/js/dataTables.bootstrap4.min.js')}}"></script>
<script src="{{asset('backend/js/datatables.js')}}"></script>
@endsection