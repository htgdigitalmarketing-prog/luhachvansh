@extends('admin.layout')

@section('content')

<link href="{{asset('backend/vendors/datatables.net-bs4/css/dataTables.bootstrap4.css')}}" rel="stylesheet">

<main class="c-main">
    <div class="container-fluid">
        <div class="fade-in">
            <div class="row">
            <div class="col-md-12">
            <div class="card">
                <div class="card-body"><h1>Recent News</h1>
            <hr>
            <div class="row">
            <div class="col-md-6">
                <form id="signupForm" method="POST" action="{{url('news/update/store/'.$get_news->id)}}">
                    @csrf
                    <div class="form-group">
                    <label class="col-form-label" for="firstname">News Title</label>
                    <input class="form-control" type="text" name="news_title" value="{{$get_news->news_title}}" placeholder="Enter News Title Here" id="">
            
                    <label class="col-form-label" for="firstname">Detailed News</label>
                        <textarea class="form-control" id="news" type="text" name="news" placeholder="Enter News Here" >{{$get_news->news}}</textarea>
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
   
    </main>

<script src="{{asset('backend/vendors/jquery/js/jquery.slim.min.j')}}s"></script>
<script src="{{asset('backend/vendors/datatables.net/js/jquery.dataTables.js')}}"></script>
<script src="{{asset('backend/vendors/datatables.net-bs4/js/dataTables.bootstrap4.min.js')}}"></script>
<script src="{{asset('backend/js/datatables.js')}}"></script>
@endsection